from reportlab.platypus import Flowable

class MCLine(Flowable):
   """Line flowable --- draws a line in a flowable"""

   def __init__(self,width, margin):
      Flowable.__init__(self)
      self.width = width
      self.leftMargin = margin
   def __repr__(self):
      return "Line(w=%s)" % self.width

   def draw(self):
      self.canv.line(self.leftMargin,0,self.width,0)
